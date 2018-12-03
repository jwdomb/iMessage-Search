const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const send = require('koa-send');

const _ = require('underscore');
const Sqlite3 = require('better-sqlite3');

const app = new Koa();
const router = new Router();

const os = require('os');

const dbpath = 'db/chat.db';
const db = new Sqlite3(dbpath, { readonly: true });

// transform Apple’s date format to UTC timestamps in SQL
const datexform = date => `(${date}/1000000 + 978307200000)`;

app
	.use(cors({ methods: 'GET' }))
	.use(bodyParser())
	.use(router.routes())
	.use(router.allowedMethods());

router.get('/api/search', async (ctx, next) => {
	const query = ctx.request.query.query;
	const handle_id = ctx.request.query.handle_id;
	const context = 1;
	const max = 100;
	const messages = db.prepare(`WITH
      ranks AS (
        SELECT is_from_me, text, (date/1000000 + 978307200000) AS date, handle_id, ${datexform('(first_value(date) OVER win)')} AS maxdate, rowid, ((RANK() OVER win) - 1) AS rank
        FROM message WINDOW win AS (PARTITION BY handle_id
        ORDER BY date ASC, rowid ASC)),
      ids AS (
        SELECT m.rowid, m.handle_id, r.rank, m.text
        FROM message m
        LEFT JOIN ranks r
        ON m.rowid = r.rowid
        WHERE m.text LIKE "%${query}%"
        ${handle_id ? ' AND m.handle_id = ' + handle_id + ' ': ''}
        LIMIT ${max})
    SELECT distinct a.is_from_me, a.date, a.rowid, a.rank, a.text, a.handle_id, a.maxdate
    FROM ranks a
    INNER JOIN ids b
    ON a.handle_id = b.handle_id
    WHERE a.rank > b.rank-${context+1} AND a.rank < b.rank+${context+1};`).all();

	messages.sort((a, b) => a.handle_id === b.handle_id ? a.rank - b.rank : a.handle_id - b.handle_id);
	let c = -1, prevr = -1, prevh = -1;
	messages.forEach(m => {
		if(m.handle_id !== prevh || m.rank !== prevr + 1) {
			c++;
		}
		prevh = m.handle_id;
		prevr = m.rank;
		m.cluster = c;
	});

	const clusters = _.groupBy(messages, 'cluster');

	const people = db.prepare(`
    SELECT ${datexform('MIN(date)')} AS mindate, ${datexform('MAX(date)')} AS maxdate, id, count(*) AS num, handle_id
    FROM message
    INNER JOIN handle ON message.handle_id = handle.ROWID
    WHERE text LIKE "%${query}%"
    GROUP BY id
    ORDER BY maxdate DESC
    LIMIT 100`).all();
	ctx.body = { messages: clusters, query, people };
});

router.get('/api/conversation', async (ctx, next) => {
	const handle_id = ctx.request.query.handle_id;
	const from = ctx.request.query.from || 0;
	const to = ctx.request.query.to || 100;

	const messages = db.prepare(`SELECT filename, mime_type, RANK() over (order by date asc, m.rowid asc) - 1 as rank, m.rowid, is_from_me, text, ${datexform('date')} AS date
    FROM message as m
        LEFT JOIN message_attachment_join ON message_id=m.rowid
        LEFT JOIN attachment a ON attachment_id=a.rowid
    WHERE handle_id = ${handle_id}
    ORDER BY date ASC, m.rowid ASC
    LIMIT ${to-from} OFFSET ${from}`).all();

	const stats = db.prepare(`SELECT count(*) AS count,
    sum(case when is_from_me = 1 then 1 end) as from_me,
    sum(case when is_from_me = 0 then 1 end) as from_them,
    ${datexform('MIN(date)')} AS from_date,
    ${datexform('MAX(date)')} AS to_date
    FROM message
    WHERE handle_id = ${handle_id}`).get();

	ctx.body = { messages, handle_id, stats };
});

router.get('/static/file', async (ctx, next) => {
	const fname = ctx.request.query.fname.replace(/^~/, os.homedir());
	await send(ctx, fname, {root:'/'});
});

app.listen(8891);
