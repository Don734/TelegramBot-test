const Scene = require('telegraf/scenes/base');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const connectDB = require('../connect');
const kb = require('../kb');
let saveDesc = '';

class SceneSelect {
    addDesc() {
        const addDesc = new Scene('addDesc');
        addDesc.enter(async (ctx) => {
            await ctx.reply('Введите описание объекта');
        })

        addDesc.on('text', async (ctx) => {
            const curDesc = ctx.message.text;

            if (curDesc) {
                saveDesc += curDesc;
                ctx.scene.enter('selectComplex');
            } else {
                await ctx.reply('Данные не верны, используйте только буквы и/или цифры');
                ctx.scene.reenter();
            }
        })

        addDesc.on('message', async (ctx) => ctx.reply('Данные не верны, используйте только буквы и/или цифры'));

        return addDesc;
    }

    selectComplex() {
        const selectComplex = new Scene('selectComplex');
        selectComplex.enter(async (ctx) => {
            const sql = `SELECT * FROM objects`;
            let arr = [];

            connectDB.query(sql, async (err, results) => {
                if (err) console.log(err);
                else console.log('Успешно');

                for (let i = 0; i < results.length; i++) {
                    const element = results[i];
                    
                    arr.push(element.object_name);
                }

                await ctx.reply('Выберите комплекс, в который хотите добавить описание', Extra.markup(
                    Markup.keyboard([
                        arr,
                        ['В меню действий']
                    ], {
                        wrap: (btn, index, currentRow) => currentRow.length == 2 / 2
                    }).resize()
                ));
            })
        })

        selectComplex.on('text', async (ctx) => {
            const curComplex = ctx.message.text;
            const sql = `UPDATE objects SET object_desc="${saveDesc}" WHERE object_name="${curComplex}"`

            if (curComplex) {
                connectDB.query(sql, async (err, results) => {
                    if (err) console.log(err);
                    else console.log('Данные обновлены');

                    await ctx.reply('Данные обновлены');
                })
            } else {
                await ctx.reply('Вы ничего не ввели, пожалуйста введите описание комплекса');
            }

            switch (curComplex) {
                case 'В меню действий':
                    await ctx.reply('Вы вернулись в меню действий.', Markup
                        .keyboard(kb.addhome)
                        .resize()
                        .extra()
                    )
                    await ctx.scene.leave();
                    break;
            }
        })

        return selectComplex;
    }
}

module.exports = SceneSelect;