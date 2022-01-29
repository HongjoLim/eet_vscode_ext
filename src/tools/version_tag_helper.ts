function get_version_number(version_tag: string){
    let version_number = version_tag.match(/\d+/)?.shift() || '0';
    return parseInt(version_number);
}

function version_tag_exists(item: string){
    return item.match(/<[vV][eE][rR]\s*:\s*\d*\s*>/) != undefined;
}

export {get_version_number, version_tag_exists};