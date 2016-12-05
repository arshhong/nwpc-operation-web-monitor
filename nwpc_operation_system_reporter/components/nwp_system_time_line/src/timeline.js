var nwpc = (function(){
    return {}
})();


var nwpc = (function(mod){
    mod.timeline = (function(){
        function version(){
            console.log("nwpc.timeline v0.0.1");
        }
        return {
            version: version
        }
    })();
    return mod;
})(nwpc);
