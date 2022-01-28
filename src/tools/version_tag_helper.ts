function get_version_number(version_tag: string){
    let version_number = version_tag.match(/\d+/)?.shift() || '0';
    return parseInt(version_number);
}

function version_tag_exists(items: string[]){
    let version_tag_exists = false;

    if(items.length >= 4){
        let trimmed_text = items[3].trim();
        version_tag_exists = trimmed_text.match(/<[vV][eE][rR]\s*:\s*\d*\s*>/) != undefined;
    }

    return version_tag_exists;
}

export {get_version_number, version_tag_exists};