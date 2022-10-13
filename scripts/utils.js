function uuid() { 
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

Date.prototype.format = function(format){
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