имам си server.js, client.js, game.js

server.js  - сървара е написан тук, пази се кой къде се намира и т.н
client.js  - цялата комуникация на играча с сървара
game.js    - рисуване, звуци, картини, кои къде се намира
index.html - казва на браузара какво да изтегли (game.js, server.js, оня странен файл)

ако някои пипне кой къде се намира в game.js, ЩЕ промени кой къде се намира, но само
локално, другите няма да видят промяна

----------------------------------------------------
Как някои се връзва
----------------------------------------------------

1.Връзва се към ip-то, сървара му дава index.html
2.Браузъра се връзва, тегли останалите файлове
3.Прочита ги, пита играча за име
----Казва си името----
4.Баузъра прави сокет към сървара, казва му с какво име иска да е играча
5.Сървара му дава simple-iр, пъшва сокета в масива с другите сокети (users), и готовия клас играч* при останалите(players)
6.Казва на всички юзъри за новия, на новия за всички останали + неговото собствено simple-id
----Съответно client.js кзва на game.js за промените и game.js разбира кои е тои самия----



Друго ще пиша после
