const Scene = require('telegraf/scenes/base');
const connect = require('../connect');

const addComplex = new Scene('addComplex');
addComplex.enter(async (ctx) => {
    await ctx.reply('Введите название объекта');
});

addComplex.on('text', async (ctx) => {
    const curNameComplex = ctx.message.text;
    const sql = `INSERT INTO objects (object_name, object_desc, object_photo1, object_photo2, object_photo3) VALUES("${curNameComplex}", " ", " ", " ", " ")`;

    if (curNameComplex) {
        connect.query(sql, (err, results) => {
            if (err) console.log(err);
            else console.log("Данные добавлены");
        });

        connect.end();
        await ctx.scene.leave();
    } else {
        await ctx.reply('Данные не верны, используйте только буквы и/или цифры');
        await ctx.scene.reenter();
    }
});

addComplex.on('message', async (ctx) => ctx.reply('Данные не верны, используйте только буквы и/или цифры'));

module.exports = addComplex;