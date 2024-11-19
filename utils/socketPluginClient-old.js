function socketWebClient(
    server,
    app
) {
    "use strict";
    var queue =
        [],
        uuid,
        uu,
        socket =
            null,
        chunkSize =
            0 *
            1024,
        socketOpen = false,
        socketSend = false;

    uuid =
        function () {
            return uu;
        };
    function init() {
        if (
            socket !==
            null
        ) {
            socket.close();
        }

        callbackStatus(
            "Conectando ..."
        );
        //********************************************
        //  connect to server at port
        //*******************************************
        socket =
            new WebSocket(
                server +
                app
            );

        socket.onopen =
            function () {
                queue =
                    [];
                callbackStatus(
                    "Conectado"
                );
            };
        socket.onerror =
            function () {
                if (
                    socketSend ===
                    false
                ) {
                    callbackStatus(
                        "No se conectó al servidor especificado"
                    );
                }
                socketSend = false;
                socketOpen = false;
                queue =
                    [];
            };
        //********************************************
        //  look at message from server
        //*******************************************
        socket.onmessage =
            function (
                msg
            ) {
                var packet;
                if (
                    msg
                        .data
                        .length ===
                    0 ||
                    msg.data.indexOf(
                        "pong"
                    ) >=
                    0
                ) {
                    return;
                }
                packet =
                    JSON.parse(
                        msg.data
                    );
                if (
                    packet.opcode ===
                    "next"
                ) {
                    //******************
                    //* server is ready for next message
                    //******************/
                    queue.shift();
                    if (
                        queue.length >
                        0
                    ) {
                        //********************************************
                        //  next in line to send
                        //*******************************************
                        msg =
                            queue[0];
                        socket.send(
                            msg
                        );
                    } else {
                        //********************************************
                        //  ready for next message; via kick start
                        //*******************************************
                        queue =
                            [];
                    }
                    return;
                }
                if (
                    packet.opcode ===
                    "ready"
                ) {
                    //********************************************
                    //  server is ready, receive  UUID from server
                    //*******************************************
                    socketOpen = true;
                    socketSend = true;
                    uu =
                        packet.uuid;
                    callbackReady(
                        packet
                    );
                    return;
                }
                if (
                    packet.opcode ===
                    "close"
                ) {
                    //********************************************
                    //  Server has closed connections
                    //*******************************************
                    socketOpen = false;
                    socketSend = false;
                    callbackStatus(
                        "La conexión con el servidor ha sido cerrada"
                    );
                    return;
                }
                //********************************************
                //  have external function look at message
                //*******************************************
                callbackReadMessage(
                    packet
                );
            };
        //********************************************
        //  server has gone
        //*******************************************
        socket.onclose =
            function () {
                queue =
                    [];
                socketOpen = false;
                socketSend = false;
                callbackClose();
            };
    }
    //********************************************
    //  messages are queued
    //*******************************************
    function sendMsg(
        msgObj
    ) {
        var i,
            j,
            nChunks,
            msg,
            sendNow = false;
        if (
            !socketSend ||
            !socketOpen
        ) {
            return;
        }
        msg =
            JSON.stringify(
                msgObj
            );

        if (
            msg.length <
            chunkSize ||
            chunkSize ===
            0
        ) {
            //********************************************
            //  normal short message
            //*******************************************
            queue.push(
                msg
            );
        } else {
            //********************************************
            //  sending long messages in chunks
            //*******************************************
            if (
                queue.length ===
                0
            ) {
                sendNow = true;
            }
            queue.push(
                "bufferON"
            ); //command for the server
            nChunks =
                Math.floor(
                    msg.length /
                    chunkSize
                );
            for (
                i = 0,
                j = 0;
                i <
                nChunks;
                i++,
                j +=
                chunkSize
            ) {
                queue.push(
                    msg.slice(
                        j,
                        j +
                        chunkSize
                    )
                );
            }
            if (
                msg.length %
                chunkSize >
                0
            ) {
                queue.push(
                    msg.slice(
                        j,
                        j +
                        (msg.length %
                            chunkSize)
                    )
                );
            }
            queue.push(
                "bufferOFF"
            ); //command for the server
        }

        if (
            (queue.length ===
                1 ||
                sendNow) &&
            socketOpen
        ) {
            //********************************************
            //  kick start sending messages
            //*******************************************
            msg =
                queue[0];
            socket.send(
                msg
            );
            sendNow = false;
        }
    }
    //********************************************
    //  dummy functions; should be set from outside
    //*******************************************

    function callbackStatus(
        p
    ) {
        // dummy callback
        return p;
    }
    function callbackReady(
        p
    ) {
        // dummy callback
        return p;
    }
    function callbackReadMessage(
        p
    ) {
        // dummy callback
        return p;
    }
    function callbackClose() {
        // dummy callback
        return "";
    }
    //**************************************************
    //  functions to set/overwrite dummy functions above
    //**************************************************

    function setCallbackStatus(
        func
    ) {
        //  overwrite dummy call back with your own func
        callbackStatus =
            func;
    }
    function setCallbackReady(
        func
    ) {
        //  overwrite dummy call back with your own func
        callbackReady =
            func;
    }
    function setCallbackReadMessage(
        func
    ) {
        //  overwrite dummy call back with your own func
        callbackReadMessage = func;
        return func
    }
    function setCallbackClose(
        func
    ) {
        //  overwrite dummy call back with your own func
        callbackClose =
            func;
    }
    //********************************************
    //   convenient
    //*******************************************
    function broadcast(
        msg
    ) {
        sendMsg(
            {
                opcode:
                    "broadcast",
                message:
                    msg,
            }
        );
    }
    //********************************************
    //  convenient
    //********************************************
    function feedback(
        msg,
        toUUID
    ) {
        console.log(
            "feedback msg",
            msg
        );
        sendMsg(
            {
                opcode:
                    "feedback",
                message:
                    msg,
                uuid: toUUID,
                from: uuid,
            }
        );
    }
    //********************************************
    //   convenient
    //*******************************************
    function echo(
        msg
    ) {
        sendMsg(
            {
                opcode:
                    "echo",
                message:
                    msg,
            }
        );
    }
    function quit() {
        //sendMsg({'opcode': 'quit'});
        socket.close();
        socketOpen = false;
        socketSend = false;
    }
    function isOpen() {
        return socketOpen;
    }
    //********************************************
    //  reveal these function to the caller
    //*******************************************

    return {
        init: init,
        sendMsg:
            sendMsg,
        uuid: uuid,
        quit: quit,
        isOpen:
            isOpen,
        setCallbackReady:
            setCallbackReady,
        setCallbackReadMessage:
            setCallbackReadMessage,
        setCallbackStatus:
            setCallbackStatus,
        setCallbackClose:
            setCallbackClose,
        broadcast:
            broadcast,
        feedback:
            feedback,
        echo: echo,
    };
}

export default socketWebClient;