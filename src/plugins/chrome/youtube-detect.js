var timePattern = /([0-9]{1,2}:([0-9]{1,2}:?){1,2})/;
var titlePattern = /([a-z].+)/i;

function getTimeAndTitle(line) {
    line = line.trim();
    var timeMatch = line.match(timePattern);

    if (timeMatch) {
        line = line.replace(timePattern, '');
        var time = timeMatch[1];
        var titleMatch = line.match(titlePattern);
        if (titleMatch) {
            var title = titleMatch[1].trim();

            return {
                time,
                title
            }
        }
    }
    return null;
}
