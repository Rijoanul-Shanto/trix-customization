let init = (function () {
    let element = document.querySelector("trix-editor");
    let slashTriggered = false;
    let searchKeyStartPosition = -1;

    return {
        element,
        slashTriggered,
        searchKeyStartPosition,
    }
}());

let searchKey = function () {
    let documentTextElement = init.element.innerText;
    let caretPosition = init.element.editor.getSelectedRange()[0];

    keyString = documentTextElement.slice(init.searchKeyStartPosition + 1, caretPosition);

    console.log('~~~', keyString);
}

let isSlashAllowed = function () {
    let documentTextElement = init.element.innerText;
    let slashPosition = init.element.editor.getSelectedRange()[0] - 1;

    return (0 === slashPosition || '\n' === documentTextElement[slashPosition - 1]) ? slashPosition : -1;
}

let handleKeyPress = function (pressedKey) {
    console.log(pressedKey);
    if ('/' === pressedKey) {
        let result = isSlashAllowed();
        -1 !== result ? (init.searchKeyStartPosition = result, init.slashTriggered = true) : undefined;
    }
    else if ('Enter' === pressedKey) {
        init.slashTriggered ? (init.searchKeyStartPosition = -1, init.slashTriggered = false) : undefined;
    } else {
        init.slashTriggered ? searchKey() : undefined;
    }
}

init.element.addEventListener("keyup", function (event) {
    handleKeyPress(event.key);
})