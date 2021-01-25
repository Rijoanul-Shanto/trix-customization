let trixInit = (function () {
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
    let documentTextElement = trixInit.element.innerText;
    let caretPosition = trixInit.element.editor.getSelectedRange()[0];

    keyString = documentTextElement.slice(trixInit.searchKeyStartPosition + 1, caretPosition);

    console.log('~~~', keyString);
}

let isSlashAllowed = function () {
    let documentTextElement = trixInit.element.innerText;
    let slashPosition = trixInit.element.editor.getSelectedRange()[0] - 1;

    return (0 === slashPosition || '\n' === documentTextElement[slashPosition - 1]) ? slashPosition : -1;
}

let slashReset = function () {
    if (trixInit.slashTriggered) {
        trixInit.element.editor.setSelectedRange([
            trixInit.searchKeyStartPosition,
            trixInit.element.editor.getSelectedRange()[0]
        ]);

        trixInit.element.editor.deleteInDirection("forward");

        trixInit.searchKeyStartPosition = -1;
        trixInit.slashTriggered = false;
    }
}

let handleKeyPress = function (pressedKey) {
    console.log(pressedKey);
    if ('/' === pressedKey) {
        let result = isSlashAllowed();
        -1 !== result ? (trixInit.searchKeyStartPosition = result, trixInit.slashTriggered = true) : undefined;
    }
    else if ('Enter' === pressedKey) {
        slashReset();
    }
    else if (' ' === pressedKey) {
        slashReset();
    }
    else {
        trixInit.slashTriggered ? searchKey() : undefined;
    }
}

trixInit.element.addEventListener("keyup", function (event) {
    handleKeyPress(event.key);
})