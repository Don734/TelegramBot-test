const Scene = require('telegraf/scenes/base');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const connect = require('../connect');
const kb = require('../kb');
let firstPhotoID = '';
let secondPhotoID = '';
let thirdPhotoID = '';

class photoScene {
    firstPhotoAdd() {
        const firstPhotoAdd = new Scene('firstPhotoAdd');
        firstPhotoAdd.enter(async (ctx) => {
            await ctx.reply('Добавьте первое фото');
        })

        firstPhotoAdd.on('photo', async(ctx) => {
            const file = ctx.message.photo.length - 1;
            const fileId = ctx.message.photo[file].file_id;

            if (fileId) {
                firstPhotoID += fileId;
                await ctx.reply('Вы загрузили первое фото.');
                ctx.scene.enter('secondPhotoAdd');
            } else {
                await ctx.reply('Пожалуйста, загрузите фото.');
                ctx.scene.reenter();
            }
        })

        return firstPhotoAdd;
    }

    secondPhotoAdd() {
        const secondPhotoAdd = new Scene('secondPhotoAdd');
        secondPhotoAdd.enter(async (ctx) => {
            await ctx.reply('Добавьте второе фото');
        })

        secondPhotoAdd.on('photo', async(ctx) => {
            const file = ctx.message.photo.length - 1;
            const fileId = ctx.message.photo[file].file_id;

            if (fileId) {
                secondPhotoID += fileId;
                await ctx.reply('Вы загрузили второе фото.');
                ctx.scene.enter('thirdPhotoAdd');
            } else {
                await ctx.reply('Пожалуйста, загрузите фото.');
                ctx.scene.reenter();
            }
        })

        return secondPhotoAdd;
    }

    thirdPhotoAdd() {
        const thirdPhotoAdd = new Scene('thirdPhotoAdd');
        thirdPhotoAdd.enter(async (ctx) => {
            await ctx.reply('Добавьте третье фото');
        })

        thirdPhotoAdd.on('photo', async(ctx) => {
            const file = ctx.message.photo.length - 1;
            const fileId = ctx.message.photo[file].file_id;

            if (fileId) {
                thirdPhotoID += fileId;
                await ctx.reply('Вы загрузили третье фото.');
                ctx.scene.enter('selectComplexPhoto');
            } else {
                await ctx.reply('Пожалуйста, загрузите фото.');
                ctx.scene.reenter();
            }
        })

        return thirdPhotoAdd;
    }

    selectComplex() {
        const selectComplex = new Scene('selectComplexPhoto');
        selectComplex.enter(async (ctx) => {
            const sql = `SELECT * FROM objects`;
            let arr = [];

            connect.query(sql, async (err, results) => {
                if (err) console.log(err);
                else console.log('Успешно');

                for (let i = 0; i < results.length; i++) {
                    const element = results[i];
                    
                    arr.push(element.object_name);
                }

                await ctx.reply('Выберите комплекс, в который хотите добавить фото', Extra.markup(
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
            const sql = `UPDATE objects SET object_photo1="${firstPhotoID}", object_photo2="${secondPhotoID}", object_photo3="${thirdPhotoID}" WHERE object_name="${curComplex}"`

            if (curComplex) {
                connect.query(sql, async (err, results) => {
                    if (err) console.log(err);
                    else console.log('Данные обновлены');

                    await ctx.reply('Данные обновлены');
                })
            } else {
                await ctx.reply('Вы ничего не ввели, пожалуйста загрузите фото');
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

module.exports = photoScene;