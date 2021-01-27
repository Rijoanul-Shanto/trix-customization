let TrixJS = function (trixConfig) {
    this.slashTriggered = false;
    this.searchKeyStartPosition = -1;
    this.holder = trixConfig.holder;
    this.inputId = trixConfig.inputId;
    this.itemListPopupTrigger = false;

    const targetEditor = document.querySelector('#' + this.holder);
    const initEditor = document.createElement('trix-editor');
    const inputField = document.createElement('input');

    inputField.setAttribute('id', this.holder + "-input");
    inputField.setAttribute('type', 'hidden');
    inputField.setAttribute('value', '');
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
                style: `border: 1px solid #ededed; border-radius: .4rem; overflow-y: scroll; max-height: 90px; max-width: 200px;`,

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
            slashTriggered ? slashReset() : undefined;
        }
        else if (' ' === pressedKey) {
            slashTriggered ? slashReset() : undefined;
        }
        else {
            slashTriggered ? searchKey() : undefined;
        }
    }

    addEventListener("trix-initialize", function (event) {
        console.log("editor is ready to use");
        loadListItems();
    })

    element.addEventListener("keyup", function (event) {
        handleKeyPress(event.key);
    })
};

const test = new TrixJS({
    holder: "trix",
});