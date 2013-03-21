// This is an active module of the csp4b2g Add-on
exports.main = function() {};

var events = require("sdk/system/events");
var tabs_tabs = require("sdk/tabs/utils");
var window = require("sdk/window/utils");
var sdk_tabs = require("sdk/tabs");
var { Ci } = require("chrome");
var img_on = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAcwAAAHMBY8FD/gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEpSURBVDiNrdO/SlxREAbw34nbiNgIbhMbjahg7RvkAWxsTJnOxlJ8AV8hpYXY2GhrZadgGwIqC0qKgPgPQSXixkmxc8NxSzcHDjN8M/PdmTvfKRFhkPNhoOr/QVDwFR2cRMQllFJamMRs5p3iPCK6GR/GDKYhqnuAbTz14ZHYJvbwp8ELtpJpAUNVd1c4SX8O433dX6AjtzCF2+prr1iOiCa+mFgTv8NURGgSNqo2v6d/XBEcJnZajbdRExwluI+19LsYxQheElvPnMBRRPxb403aNibSv8cjfqdt4u03NdnBajXfc9qdaoTdasQmb7VR8Ud8xq8q+JA/bizvUl/xT72tjZQE3n1auJZK1BPRA1Ywr6c2OMMPfMuOv+hp41MZ5DWWUspABPAXLd6RrBjotPIAAAAASUVORK5CYII=';
var img_off = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAcwAAAHMBY8FD/gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEDSURBVDiNrdM/K4dRFAfwzzUoZFVikFAWlDJYLHaLxWzwCiRvwEuwGkwsFotMUhSbhUHZlCwoJf+uwaH7ezxKPW6dTn3P93vOPeeem3LOmpy2Rur/SJCwiEtc5Jxv/iRKqQMjGIJc2B6mcs7qDKPYwluhsYljvBTgco14qSK8wn5JGMRuBN+xUMTmCvEBJr9jlSrtOA3iSYEfBXaGzhZNzVVXgvyKbnQV7a1W+XXP2B/+Ho94Cg89P9iV6tNBztgu8J3A7jBR0ejDDNaj2teEewvSAK4j9oA1jEd7LXuQcYjhmtmMxRCrfLc+92ADs78tUSRJmI+WzvGcmvzGlFJqlAA+AEBL8HWnz9DjAAAAAElFTkSuQmCC';
 
function getRequestWindow(request) {
    try {
        if (request.notificationCallbacks)
        return request.notificationCallbacks.getInterface(Ci.nsILoadContext).associatedWindow;
    } catch(e) {}
    try {
        if(request.loadGroup && request.loadGroup.notificationCallbacks)
        return request.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext).associatedWindow;
    } catch(e) {}
    return null;
} 

function getTabFromChannel(channel) {
    var wnd = getRequestWindow(channel);
    return (wnd && wnd.top == wnd) ? tabs_tabs.getTabForContentWindow(wnd) : null;
}
 
function csp4b2g() {
    this.enabled = false;
    
    this.widget = require("sdk/widget").Widget({
      id: "csp4b2g icon",
      label: "csp4b2g",
      contentURL: img_off,
      onClick: this.toggle.bind(this)
    });
    
    sdk_tabs.on('activate',this.tabChange.bind(this));
    events.on("http-on-examine-response", this.modify, true);
}

csp4b2g.prototype.tabChange = function (event) {
    this.showUI();
}

csp4b2g.prototype.modify = function (event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var tab = getTabFromChannel(channel);
    if(tab && tab._isFettered){
        channel.setResponseHeader("X-Content-Security-Policy", "default-src *; script-src 'self'; object-src 'none'; style-src 'self'", false);
    }
}

csp4b2g.prototype.activeTab = function() {
  return tabs_tabs.getActiveTab(window.getMostRecentBrowserWindow());  
};

csp4b2g.prototype.toggle = function() {
    var tab = this.activeTab();
    
    tab._isFettered = !tab._isFettered;
    this.showUI();
};

csp4b2g.prototype.showUI = function() {
    var tab = this.activeTab();
    if(tab._isFettered){
        this.widget.contentURL = img_on;
    } else {
        this.widget.contentURL = img_off;
    }
};

var thingy = new csp4b2g();
