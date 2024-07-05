// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Investors", {
	// refresh(frm) {
    //     get_investors_details(frm);
	// },
    onload(frm){
        console.log(frm.doc.inv_details.length);
        if (frm.doc?.inv_details.length > 0 ){
            validate_vehicle_registration(frm);
            get_investors_details(frm);
        }
        else{
            get_investors_details(frm);
        }
    },
});

var get_investors_details = function(frm){
    frappe.call({
        method: 'car_rental_system.car_rental_system.doctype.investors.investors.get_investment',
        args:{
            name: frm.doc.name,
        },
        callback: function (r){
            if (r.message.investment >0 ){
                frm.set_value('total_investment',r.message.investment);
                refresh_field("inv_details");
                console.log(r.message.get_investment);
                $.each(r.message.get_investment, function (_i, e) {
                    let entry = frm.add_child('inv_details');
                    entry.asset_no = e.name;
                    entry.asset_name = e.model_name;
                    entry.date_of_investment = e.immarticulation_date;
                    entry.share_percentage = e.inv_percentage;
                    entry.amt_of_investment = e.investment_amount;
                });
                refresh_field("inv_details");
                
            }
            else{
                frappe.throw({
                    title: __('Information'),
                    indicator: 'yellow',
                    message: __('Investor doesnot yet own a vehicle')
                });
            }
            
        }
    });
}

var validate_vehicle_registration = function (frm) {
    seen = []
   // console.log(frm.doc.inv_details);
    for (item of frm.doc.inv_details) {
        if (seen.includes(item.asset_no)) {
            // frappe.throw({ message: __("Investor already exist or investment percentage is zero"), title: __('Validation Error'), indicator: 'red' });
            console.log('afroz',seen);
            return false;
        }
        else{
            seen.push(item.asset_no);
            console.log('zeeshan',seen);
            get_investors_details(frm);
        }
    }
}