const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const path = require('path');
const config = require('./config');
const connectDB = require('./connect');
const kb = require('./kb');
const kb_btns = require('./kb-btns');
const helper = require('./helper');
const addComplex = require('./controllers/addComplex');
const SceneSelect = require('./controllers/selectComplex');
const addPhoto = require('./controllers/addPhoto');
const curScene = new SceneSelect();
const curPhoto = new addPhoto();
const addDesc = curScene.addDesc();
const selectComplex = curScene.selectComplex();
const firstPhoto = curPhoto.firstPhotoAdd();
const secondPhoto = curPhoto.secondPhotoAdd();
const thirdPhoto = curPhoto.thirdPhotoAdd();
const selectComplexPhoto = curPhoto.selectComplex()
const { leave } = Stage;

helper.logStart();

const bot = new Telegraf(config.TOKEN);

const stage = new Stage([
    addComplex,
    addDesc,
    selectComplex,
    firstPhoto,
    secondPhoto,
    thirdPhoto,
    selectComplexPhoto
]);

bot.use(stage.middleware());

bot.hears(kb_btns.addhome.addName, async (ctx) => {
    ctx.scene.enter('addComplex');
})

bot.hears(kb_btns.addhome.addDesc, async (ctx) => {
    ctx.scene.enter('addDesc');
})

bot.hears(kb_btns.addhome.addPhoto, async (ctx) => {
    ctx.scene.enter('firstPhotoAdd');
})

bot.start((ctx) => {
    ctx.reply(ctx.i18n.t('greeting'), Markup
        .keyboard(kb.main)
        .resize()
        .extra()
    );
});

bot.on('text', ctx => {
    const text = ctx.message.text;
    let lat = 41.294051,
    long = 69.333980;
    const sql = `SELECT * FROM objects`;
    let arr = [];

    const delKey = Markup.inlineKeyboard([
        Markup.callbackButton('Закрыть \u{274C}', 'delete')
    ])

    switch (text) {
        case kb_btns.main.catalog:
            ctx.reply('Что хотите узнать?', Markup
            .keyboard(kb.catalog)
            .resize()
            .extra()
            )
            break;
        case kb_btns.main.admin:
            if (helper.adminUsers(ctx.message.chat.id)) {
                ctx.reply('Добро пожаловать в админ-панель', 
                Markup
                .keyboard(kb.admin)
                .resize()
                .extra()
                );
            } else {
                ctx.reply('Вам сюда нельзя!');
                Markup
                .oneTime()
            }
            break;
        case kb_btns.main.contacts:
            ctx.replyWithHTML(helper.contactText(), Extra.markup(delKey));
            ctx.replyWithLocation(lat, long, Extra.markup(delKey));
            break;
        case kb_btns.main.back:
            ctx.reply('Вы вернулись в главное меню', Markup
            .keyboard(kb.main)
            .resize()
            .extra()
            )
            break;
    }

    switch (text) {
        case kb_btns.catalog.apart:
            connectDB.query(sql, (err, results) => {
                if (err) console.log(err);

                for (let i = 0; i < results.length; i++) {
                    const element = results[i];
                    
                    arr.push(element.object_name);
                }

                ctx.reply('Выберите комплекс для выбора комнат', Extra.markup(
                    Markup.keyboard([
                        arr,
                        ['В каталог']
                    ], {
                        wrap: (btn, index, currentRow) => currentRow.length == 2 / 2
                    }).resize()
                ));
            })
            break;   
        case kb_btns.catalog.about:
            connectDB.query(sql, (err, results) => {
                if (err) console.log(err);

                for (let i = 0; i < results.length; i++) {
                    const element = results[i];
                    
                    arr.push(`Описание о "${element.object_name}"`);
                }

                ctx.reply('Выберите комплекс, о котором хотите получить описание', Extra.markup(
                    Markup.keyboard([
                        arr,
                        ['В каталог']
                    ], {
                        wrap: (btn, index, currentRow) => currentRow.length == 2 / 2
                    }).resize()
                ));
            })
            break;       
    }

    connectDB.query(sql, async (err, results) => {
        if (err) console.log(err);

        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            
            switch (text) {
                case `Описание о "${element.object_name}"`:
                    const showDesc = `SELECT * FROM objects WHERE object_name="${element.object_name}"`;
                    connectDB.query(showDesc, async (err, results) => {
                        if (err) console.log(err);
                        
                        for (let i = 0; i < results.length; i++) {
                            const element = results[i];

                            ctx.replyWithPhoto(element.object_photo1, Extra.markdown().markup(delKey))
                            ctx.replyWithPhoto(element.object_photo2, Extra.markdown().markup(delKey))
                            ctx.replyWithPhoto(element.object_photo3, Extra.load({ caption: element.object_desc }).markdown().markup(delKey))
                        }
                    })
                    break;
                case 'В каталог':
                    ctx.reply('Вы вернулись в каталог', Markup
                    .keyboard(kb.catalog)
                    .resize()
                    .extra()
                    )
                    break;
            }
        }
    })

    connectDB.query(sql, async (err, results) => {
        if (err) console.log(err);

        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            
            switch (text) {
                case element.object_name:
                    ctx.reply('Выберите один из пунктов, которые хотите добавить.', Markup
                    .keyboard(kb.apart)
                    .resize()
                    .extra()
                    )
                    break;
                case 'В каталог':
                    ctx.reply('Вы вернулись в каталог', Markup
                    .keyboard(kb.catalog)
                    .resize()
                    .extra()
                    )
                    break;
            }
        }
    })

    switch (text) {
        case kb_btns.admin.addhome:
            ctx.reply('Выберите один из пунктов, которые хотите добавить.', Markup
            .keyboard(kb.addhome)
            .resize()
            .extra()
            )
            break;
        case kb_btns.addhome.back:
            ctx.reply('Вы вернулись в админ-панель.', Markup
            .keyboard(kb.admin)
            .resize()
            .extra()
            )
            break;
    }

    switch (text) {
        case kb_btns.apart.room1:
        case kb_btns.apart.room2:
            ctx.replyWithPhoto('AgACAgIAAxkBAAIJgF8amIMf8JBZe7CTWjp2fg-GP4BmAALdrTEb5tfQSCRLf_1lK2FMZa54kS4AAwEAAwIAA3gAA4sCBgABGgQ', Extra.load({ 
                    caption: `Описание: 1-х ком. 35 кв.м.+5 кв.м.Балкон.\n1-х ком. 40кв.м. +5 кв.м.Балкон.\n1-х ком. 42 кв.м.+6 кв.м.Балкон.\n2-х ком. 46 кв.м.+5 кв.м.Балкон.\n2-х ком. 55 кв.м.+5 кв.м.Балкон.\n2-х ком. 61 кв.м.+6 кв.м.Балкон.\nКонтакты:\n+99897 7556666\n+99897 7886666\n+99897 7784848` 
                }).markdown().markup(delKey))
            break;
        case kb_btns.apart.room3:
            ctx.replyWithPhoto('AgACAgIAAxkBAAIJSV8YYLZmVelMBx_2w1p1WLCzw1HpAAJ0rzEbpsHBSOrihH03o2-K7E0SlS4AAwEAAwIAA3gAA1nfAQABGgQ', Extra.load({ 
                caption: `Описание: 3-х ком. 75 кв. м. + 10 кв. м. балкон.\nКонтакты:\n+99897 7556666\n+99897 7886666\n+99897 7784848` 
            }).markdown().markup(delKey))
            break;
        case kb_btns.apart.room4:
            ctx.replyWithPhoto('AgACAgIAAxkBAAIJTl8YYZ2UZuT4f5F8sFs7t-GstNTrAAJ2rzEbpsHBSIeH257tILxTNeEWlS4AAwEAAwIAA3gAAyLcAQABGgQ', Extra.load({ 
                caption: `Описание: 4-х ком. 95 кв. м. + 10 кв. м. балкон.\nКонтакты:\n+99897 7556666\n+99897 7886666\n+99897 7784848` 
            }).markdown().markup(delKey))
            break;
        case kb_btns.apart.back:
            ctx.reply('Вы вернулись к списку этажей', Markup
            .keyboard(kb.catalog)
            .resize()
            .extra()
            )
            break;
    }
})

bot.action('delete', ({ deleteMessage }) => deleteMessage())

bot.on('photo', ctx => {
    console.log(ctx.message.photo);
})

bot.launch();