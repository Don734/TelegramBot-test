module.exports = {
    logStart() {
        console.log('Бот запущен!');
    },

    contactText() {
        const html = `
            <b><u>Адрес:</u></b>
            <i>г. Ташкент, Яшнабадский район, 2-й пр-д Авиасозлар.
            Ориентир: Дворец Авиастроителей (детский сад №481)</i> <b><u>Телефон:</u></b>
            <i>+998 97 755 66 66
            +998 97 788 66 66
            +998 97 444 00 87</i>
        `;

        return html;
    },

    adminUsers(userID) {
        const users = [111754178, 543580667];

        return users.includes(userID);
    }
}