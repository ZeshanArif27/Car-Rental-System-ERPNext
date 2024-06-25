// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Car Reservation", {
	refresh(frm) {

	},
    map: function(frm){
        //console.log(JSON.parse(frm.doc.map));
        let mapdata = JSON.parse(cur_frm.doc.map).features[0];
        if (mapdata && mapdata.geometry.type == "Point") {
            let lat = mapdata.geometry.coordinates[1];
            let lon = mapdata.geometry.coordinates[0];
            console.log(lat,lon);
            frappe.call({
                type: "GET",
                url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                callback: function(r) {
                    console.log(r.display_name);
                    frm.set_value('dropoff_location',r.display_name);
                }
            });
        }
    },
});
