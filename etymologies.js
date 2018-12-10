let etymologies = {};
function addEtymology(char, definition, notes, components, images) {
    components = components || [];
    for (let component of components) {
        if (isRadicalForm(component.char)) {
            component.notes = radicalNote(component.char) + (component.notes || "");
        }
    }
    etymologies[char] = {
        notes: notes || "",
        definition: definition || "",
        components: components || [],
        images: getImages(images, char)
    }
}

function getFragments(leftStrokes, isReversed) {
    let fragments = {};
    if (typeof leftStrokes === "number") {
        fragments.left = [0, leftStrokes];
        fragments.right = [leftStrokes];
    } else {
        fragments = {
            left: leftStrokes[0],
            right: leftStrokes[1]
        }
    }
    if (isReversed) {
        let temp = fragments.left;
        fragments.left = fragments.right;
        fragments.right = temp;
    }
    return fragments;
}

function semsem(char, left, right, leftStrokes, definition, notes) {
    addEtymology(char, definition, notes, [{
        type: "meaning",
        char: left,
        fragment: [0, leftStrokes]
    }, {
        type: "meaning",
        char: right,
        fragment: [leftStrokes]
    }])
}

function semphon(char, left, right, leftStrokes, definition, notes, isObsoleteSound, isSoundAndMeaning, isReversed, images) {
    let defaultNote = `Phonosemantic compound. ${left} represents the meaning and ${right} represents the sound. `;
    notes = defaultNote + (notes || "");
    let fragments = getFragments(leftStrokes, isReversed);
    addEtymology(char, definition, notes, [{
        type: "meaning",
        char: left,
        fragment: fragments.left
    }, {
        type: "sound",
        char: right,
        fragment: fragments.right,
        notes: (isObsoleteSound ? obsoleteSound(char, right) : "") + (isSoundAndMeaning ? alsoMeaning(char) : "")
    }], images)
}

function phonsem(char, left, right, leftStrokes, definition, notes, isObsoleteSound, isSoundAndMeaning, images) {
    return semphon(char, right, left, leftStrokes, definition, notes, isObsoleteSound, isSoundAndMeaning, true, images);
}

let types = {
    o: "oracle",
    b: "bronze",
    s: "seal"
};
let captions = {
    o: "Oracle bone script",
    b: "Bronze script",
    s: "Seal script"
}

function getImages(abbr, char) {
    return (abbr || "").split("").map(x => {
        let type = types[x],
            caption = captions[x];
        return {
            url: etymologyImages[type][char],
            caption
        };
    });
}

function icon(char, definition, notes, img, components) {
    addEtymology(char, definition, notes, components, img)
}

function meaningComponent(char, fragment, notes) {
    return {
        type: "meaning",
        char,
        fragment,
        notes
    }
}

function simplifiedComponent(char, fragment, notes) {
    return {
        type: "simplified",
        char,
        fragment,
        notes
    }
}

function soundComponent(char, fragment, notes) {
    return {
        type: "sound",
        char,
        fragment,
        notes
    }
}

function iconComponent(char, fragment, notes) {
    return {
        type: "iconic",
        char,
        fragment,
        notes
    }
}

function unknownComponent(char, fragment, notes) {
    return {
        type: "unknown",
        char,
        fragment,
        notes: unknownComonentNote() + (notes || "")
    }
}

let radicals = {
    bottom: {
        "龰": "止",
        "夂": "止",
        "灬": "火"
    },
    left: {
        "亻": "人",
        "彳": "行",
        "辶": "辵",
        "⺼": "肉",
        "讠": "言",
        "氵": "水",
        "扌": "手",
        "钅": "金",
        "釒": "金",
        "忄": "心",
        "⺮": "竹",
        "犭": "犬",
        "纟": "糸",
        "糹": "糸",
        "冄": "冉",
        "衤": "衣",
        "飠": "食",
        "饣": "食"
    },
    right: {
        "刂": "刀",
        "⻏": "邑",
        "攵": "攴"
    },
    top: {
        "艹": "艸"
    }
};

function isRadicalForm(char) {
    return !!getRadicalOriginal(char);
}

function getRadicalOriginal(char) {
    for (let direction in radicals) {
        let original = radicals[direction][char];
        if (original) {
            return { original, direction };
        }
    }
}

function radicalNote(radical) {
    let { original } = getRadicalOriginal(radical);
    return `${radical} is a component form of ${original}. `;
}

function shiftMeaning(newMeaning, oldMeaning) {
    if (oldMeaning) {
        return `Based on the original meaning "${oldMeaning}". ` + shiftMeaning(newMeaning);
    }
    return `The meaning of this character has shifted over time and now means "${newMeaning}". `
}
function obsoleteMeaning(oldMeaning) {
    return `The character is based on the original meaning "${oldMeaning}", which is unrelated to the modern meaning. `;
}
function obsoleteSound(char, soundComp) {
    return `The pronunciation of ${char} was similar to ${soundComp} in old Chinese, but they no longer sound similar in modern Mandarin due to historical phonetic changes. `;
}

function alsoMeaning(char) {
    return `${char} also serves as a meaning component. `;
}

function unknownComonentNote() {
    return `The purpose of this component is unclear. `;
}

function simplified(trad) {
    return `Simplified form of ${trad}. `;
}

function soundLoan(newMeaning, oldMeaning, newChar) {
    return `The current meaning "${newMeaning}" is a phonetic loan. The original meaning "${oldMeaning}" is now written as ${newChar}.`;
}

function simplifyMerge(simp, trad, meaning) {
    return `In simplified Chinese ${simp} is also used to mean "${meaning}", while in traditional Chinese this meaning is written with a separate character ${trad}.`;
}

function simp(simplifiedChar, traditionalChar, fragments) {
    let simplifiedEtymology = { ...etymologies[traditionalChar] };
    simplifiedEtymology.notes = simplified(traditionalChar) + (simplifiedEtymology.notes || "");
    if (fragments) {
        simplifiedEtymology.components = simplifiedEtymology.components.slice();
        fragments.forEach((fragment, i) => {
            let component = simplifiedEtymology.components[i];
            component = { ...component };
            component.fragment = fragment;
            simplifiedEtymology.components[i] = component;
        });
    }
    etymologies[simplifiedChar] = simplifiedEtymology;
}