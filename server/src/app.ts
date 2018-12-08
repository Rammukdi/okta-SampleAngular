import * as graphqlHttp from 'express-graphql';
import { buildSchema } from 'graphql';
import * as sqlite3 from 'sqlite3';
import serverFactory from './serverFactory';

const server = serverFactory();
const db = new sqlite3.Database('tennis.db');

const schema = buildSchema(`
  type Query {
    players(offset:Int = 0, limit:Int = 10): [Player]
    player(id:ID!): Player
    rankings(rank:Int!): [Ranking]
  }

  type Player {
    id: ID
    first_name: String
    last_name: String
    hand: String
    birthday: Int
    country: String
  }

  type Ranking {
    date: Int
    rank: Int
    player: Player
    points: Int
  }
`);

function query(sql: any, single: any) {
    return new Promise((resolve, reject) => {
        const callback = (err: any, result: any) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        };

        if (single) db.get(sql, callback);
        else db.all(sql, callback);
    });
}

const root = {
    players: (args: any) => {
        return query(
            `SELECT * FROM players LIMIT ${args.offset}, ${args.limit}`,
            false,
        );
    },
    player: (args: any) => {
        return query(`SELECT * FROM players WHERE id='${args.id}'`, true);
    },
    rankings: (args: any) => {
        return query(
            `SELECT r.date, r.rank, r.points,
                p.id, p.first_name, p.last_name, p.hand, p.birthday, p.country
        FROM players AS p
        LEFT JOIN rankings AS r
        ON p.id=r.player
        WHERE r.rank=${args.rank}`,
            false,
        ).then((rows: any) =>
            rows.map((result: any) => {
                return {
                    date: result.date,
                    points: result.points,
                    rank: result.rank,
                    player: {
                        id: result.id,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        hand: result.hand,
                        birthday: result.birthday,
                        country: result.country,
                    },
                };
            }),
        );
    },
};

server.use(
    '/graphql',
    graphqlHttp({
        schema,
        rootValue: root,
        graphiql: true,
    }),
);

server.listen(4201, (err: any) => {
    if (err) {
        return console.log(err);
    }
    return console.log('My Express App listening on port 4201');
});
