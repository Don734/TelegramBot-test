const kb = require('./kb-btns');

module.exports = {
    main: [
        [kb.main.catalog, kb.main.contacts],
        [kb.main.faq, kb.main.admin]
    ],
    catalog: [
        [kb.catalog.apart, kb.catalog.about],
        [kb.main.back]
    ],
    admin: [
        [kb.admin.addhome, kb.admin.editcontacts],
        [kb.main.back]
    ],
    addhome: [
        [kb.addhome.addName, kb.addhome.addDesc, kb.addhome.addPhoto],
        [kb.addhome.back],
    ],
    apart: [
        [kb.apart.room1, kb.apart.room2],
        [kb.apart.room3, kb.apart.room4],
        [kb.apart.back]
    ]
}