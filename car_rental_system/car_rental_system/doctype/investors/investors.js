// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Investors", {
	refresh(frm) {
        frm.trigger('total_investment');
	},
    total_investment: function (frm){
        
            frappe.call({
                method: 'car_rental_system.car_rental_system.doctype.investors.investors.total_investment',
                args:{
                    name: frm.doc.name,
                },
                callback: function (r){
                    frm.set_value('total_investment',r.message.investment);
                }
            })
        
        
    },
    
});
