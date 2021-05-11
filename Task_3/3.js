/*Задание 3.
Реализовать чат на основе эхо-сервера wss://echo.websocket.org/
Интерфейс состоит из input, куда вводится текст сообщения, и кнопки «Отправить».
При клике на кнопку «Отправить» сообщение должно появляться в окне переписки.
Эхо-сервер будет отвечать вам тем же сообщением, его также необходимо выводить в чат.
Добавить в чат механизм отправки гео-локации.
При клике на кнопку «Гео-локация» необходимо отправить данные серверу и в чат вывести ссылку на https://www.openstreetmap.org/ с вашей гео-локацией.
Сообщение, которое отправит обратно эхо-сервер, не выводить. */



function pageLoaded() {
    const wsUrl = "wss://echo.websocket.org";
    let webSocket;

    const startChat = document.querySelector(".btn_start_chat");
    const endChat = document.querySelector(".btn_end_chat");
    const getLocation = document.querySelector(".btn_get_location");
    const msgInput = document.querySelector(".msg_input");
    const btnSend = document.querySelector(".btn_send");
    const msgContainer = document.querySelector(".msg_container");
    const chatPlaceholder = document.querySelector(".chat_placeholder");

    const userMsgClass = "my_message";
    const replyMsgClass = "reply_message";
    const systemMsgClass = "system_message";

    let sendOnly = false;

    function appendMsg(msg, msgClass) {
        chatPlaceholder.remove();
        let newP = document.createElement("p");
        newP.classList.add(msgClass);
        newP.innerHTML = msg;
        msgContainer.appendChild(newP);
        return newP;
    }

    function systemMsg(msg) {
       return appendMsg(msg, systemMsgClass);
    }

    function sendMsg(msg) {
        if (webSocket) {
            webSocket.send(msgInput.value);
            msgInput.value = "";
        } else {
            return systemMsg("Сначала подключитесь к чату");
        }
        return appendMsg(msg, userMsgClass);
    }

    function getMsg(msg) {
        if (sendOnly) {
            return sendOnly = false;
        }
        return appendMsg(msg, replyMsgClass);
    }


    startChat.addEventListener("click", () => {
        webSocket = new WebSocket(wsUrl);
        webSocket.onopen = function (event) {
            systemMsg("Вы подключились к чату");
        };
        webSocket.onclose = function (event) {
            systemMsg("Вы отключились от чата");
        };
        webSocket.onerror = function (event) {
            systemMsg("Произошла ошибка");
        }
        webSocket.onmessage = function (event) {
            getMsg(event.data);
        }
    });

    endChat.addEventListener("click", () =>{
        webSocket.close();
        webSocket = null;
    });

    function geoSuccess(position) {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
        sendMsg(`<a href="https://www.openstreetmap.org/#map=5/${latitude}/${longitude}" target="_blank">https://www.openstreetmap.org/#map=5/${latitude}/${longitude}</a>`);
        webSocket.send(`${latitude}/${longitude}`);
    }

    const geoError = () => {
        alert("Невозможно получить ваше местоположение");
    }

    getLocation.addEventListener("click", () => {
        sendOnly = true;
        if (!navigator.geolocation) {
            alert("Гео-локация не поддерживается вашим браузером");
        } else if (webSocket) {
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
        }else {
            systemMsg("Сначала подключитесь к чату");
        }
        });
    btnSend.addEventListener("click", () => {
        if (msgInput.value.trim() === "") {
            systemMsg("Сообщение не должно быть пустым")
        } else {
            sendMsg(msgInput.value)
        }
    })
    }

    document.addEventListener("DOMContentLoaded", pageLoaded);