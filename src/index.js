let TrixJS = function (trixConfig) {
    this.holder = trixConfig.holder;
    this.inputId = trixConfig.inputId;
    this.value = trixConfig.value;

    let resetCaretPosition = -1;
    let slashTriggered = false;
    let searchKeyStartPosition = -1;
    let listIndex = -1;
    let listItemSelected = undefined;

    const targetEditor = document.querySelector('#' + this.holder);
    const initEditor = document.createElement('trix-editor');
    const inputField = document.createElement('input');

    inputField.setAttribute('id', this.holder + "-input");
    inputField.setAttribute('type', 'hidden');
    inputField.setAttribute('value', this.value);
    inputField.setAttribute('name', "content");
    initEditor.setAttribute('input', this.holder + "-input");

    targetEditor.appendChild(inputField);
    targetEditor.appendChild(initEditor);

    const element = document.querySelectorAll("#" + this.holder + " trix-editor")[0];


    let makeHtmlElement = function (elementConfig) {
        let htmlElement = document.createElement(elementConfig.name);
        for (key in elementConfig.properties) {
            htmlElement.setAttribute(key, elementConfig.properties[key]);
        }

        return htmlElement;
    }

    let loadListItems = function () {
        let div = makeHtmlElement({
            name: "div",
            properties: {
                style: `border: 1px solid #ededed; border-radius: .4rem; max-height: 190px; max-width: 200px;`,

            }
        });

        let ul = makeHtmlElement({
            name: "ul",
            properties: {
                style: `list-style-type: none; padding-left: 0`,
            }
        });

        const listItems = {
            heading1: "Heading",
            quote: "Quote",
            code: "Code",
            bullet: "Bullet List",
            number: "Numbered List",
        }

        for (item in listItems) {
            let li = makeHtmlElement({
                name: "li",
                properties: {
                    name: listItems[item],
                    id: item,
                }
            });
            li.innerText = listItems[item];
            ul.appendChild(li);
        }
        console.log(ul);
        div.appendChild(ul);

        targetEditor.appendChild(div);
    }

    function itemListReset() {
        let itemList = targetEditor.querySelector("ul");
        let li = itemList.getElementsByTagName("li");
        let i = 0, listLength = li.length;
        for (i = 0; i < listLength; i++) li[i].style.display = "";
    }

    function searchItemList(keyString) {
        let itemList = targetEditor.querySelector("ul");
        let li = itemList.getElementsByTagName("li");
        let i = 0, listLength = li.length, listValue = "", filter = keyString.toUpperCase();
        for (i = 0; i < listLength; i++) {
            listValue = li[i].textContent;
            if (listValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }

    function travelItemList(pressedKey) {
        console.log("traveling");
        let itemList = targetEditor.querySelector("ul").getElementsByTagName('li'), i = 0, j = 0;
        let itemLength = itemList.length;

        if ("ArrowUp" === pressedKey) {
            for (i = itemLength - 1; i >= 0; i--) {
                if (null === itemList[i].getAttribute("style")) {
                    itemList[i].classList.add("selected");
                }
            }
            console.log("up");
        }
        else {
            if (undefined === listItemSelected) {
                listIndex = 0;

                listItemSelected = itemList[0];
                listItemSelected.classList.add("selected");
            }
            else {
                listItemSelected.classList.remove("selected");
                while (null !== listItemSelected.nextSibling) {
                    listItemSelected = listItemSelected.nextSibling;
                    if (null === listItemSelected.getAttribute("style")) {
                        listItemSelected.classList.add("selected");
                        break;
                    }   
                }
            }
        }
    }

    let searchKey = function () {
        let documentTextElement = element.innerText;
        let caretPosition = element.editor.getSelectedRange()[0];

        keyString = documentTextElement.slice(searchKeyStartPosition + 1, caretPosition);
        searchItemList(keyString.trim());
        console.log('~~~', keyString);
    }

    let isSlashAllowed = function () {
        let documentTextElement = element.innerText;
        let slashPosition = element.editor.getSelectedRange()[0] - 1;

        return (0 === slashPosition || '\n' === documentTextElement[slashPosition - 1]) ? slashPosition : -1;
    }

    let slashReset = function () {
        if (slashTriggered) {
            element.editor.setSelectedRange([
                searchKeyStartPosition,
                element.editor.getSelectedRange()[0]
            ]);

            element.editor.deleteInDirection("forward");

            searchKeyStartPosition = -1;
            slashTriggered = false;
        }
    }

    let handleKeyPress = function (pressedKey) {
        console.log(pressedKey);

        if ('/' === pressedKey) {
            let result = isSlashAllowed();
            -1 !== result ? (
                searchKeyStartPosition = result,
                slashTriggered = true,
                itemListPopupTrigger = true
            ) : undefined;
        }
        else if ('Enter' === pressedKey) {
            slashTriggered ? (
                slashReset(),
                itemListReset()
            ) : undefined;
        }
        else if ('' === pressedKey) {
            console.log('' === pressedKey);
            slashTriggered ? (
                itemListReset()
            ) : undefined;
        }
        else if ("ArrowUp" === pressedKey || "ArrowDown" === pressedKey) {
            slashTriggered ? (
                element.editor.setSelectedRange([resetCaretPosition, resetCaretPosition]),
                travelItemList(pressedKey)
            ) : undefined;
        }
        else {
            slashTriggered ? searchKey() : undefined;
        }
    }

    addEventListener("trix-initialize", function (event) {
        console.log("editor is ready to use");
        loadListItems();
    });

    element.addEventListener("keyup", function (event) {
        handleKeyPress(event.key.trim());
    });

    element.addEventListener("keydown", function (event) {
        resetCaretPosition = element.editor.getSelectedRange()[0];
        console.log("down", resetCaretPosition);
    });

    return {
        element,
    }
};

const test = new TrixJS({
    holder: "trix",
    value: "<h1>hello</h1>",
});