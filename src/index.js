let TrixJS = function (trixConfig) {
    this.slashTriggered = false;
    this.searchKeyStartPosition = -1;
    this.holder = trixConfig.holder;
    this.inputId = trixConfig.inputId;

    let targetEditor = document.querySelector('#' + this.holder);
    let initEditor = document.createElement('trix-editor');
    initEditor.setAttribute('input', this.inputId);

    targetEditor.appendChild(initEditor);


    let element = document.querySelectorAll("#trix trix-editor")[0];

    let searchKey = function () {
        let documentTextElement = element.innerText;
        let caretPosition = element.editor.getSelectedRange()[0];

        keyString = documentTextElement.slice(searchKeyStartPosition + 1, caretPosition);

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
            -1 !== result ? (searchKeyStartPosition = result, slashTriggered = true) : undefined;
        }
        else if ('Enter' === pressedKey) {
            slashReset();
        }
        else if (' ' === pressedKey) {
            slashReset();
        }
        else {
            slashTriggered ? searchKey() : undefined;
        }
    }

    element.addEventListener("keyup", function (event) {
        handleKeyPress(event.key);
    })
};

let test = new TrixJS({
    holder: "trix",
    inputId: "trix-input"
});