export default Date.prototype.format = function(format){
    const patterns = {
        'Y': this.getFullYear,
        'y': this.getYear,
        'm': function() {
            var month = this.getMonth();
            month += 1;
            month < 10 ? "0" + month : month;
            
            return month;
        },
        'n': function() {
            var month = this.getMonth();
            month += 1;
            
            return month;
        },
        'd': this.getDate
    };

    for(var [key, val] of Object.entries(patterns)) {
        if(format.match(key)) {
            var regex = new RegExp(key, 'g');
            format = format.replace(regex, val.bind(this)());
        }
    }

    return format;
};