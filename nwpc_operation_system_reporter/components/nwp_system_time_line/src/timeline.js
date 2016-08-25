var nwpc = (function(){
    return {}
})();


var nwpc = (function(mod){
    nwpc.timeline = (function(){
        var wdp = function(){
            console.log("nwpc.timeline.wdp");
        };
        return {
            wdp: wdp
        }
    })();
    return mod;
})(nwpc);
