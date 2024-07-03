// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle Registration", {
	// refresh(frm) {
       
    //     //frm.trigger('purchase_value')
    //     //console.log(frm.doc.purchase_details);
	// },
    purchase_value: function (frm) {
        calculate_investment(frm);
    }
    //     frappe.call({
    //         method: 'car_rental_system.car_rental_system.doctype.vehicle_registration.vehicle_registration.calculate_total_amount',
    //         args: {
    //             'purchase_value':frm.doc.purchase_value,
    //             'car_owner':frm.doc.car_owner,
    //             'purchase_details':frm.doc.purchase_details,
    //         },
    //         callback: function(r){
    //             if (frm.doc.car_owner == 'Company'){
    //                 frm.set_value('amount', r.message)
    //                 console.log(r.message);
    //             }
    //             else{
    //                 console.log(r.message);
    //                 frm.set_value('purchase_details',[]);
    //                 refresh_field("purchase_details");
    //                 $.each(r.message.investment, function(_i, e) {
    //                     let entry = frm.add_child('purchase_details');
    //                     entry.investor_id = e.investor_id;
    //                     entry.inv_percentage = e.get_percent;
    //                     entry.investment_amount = e.invested_amount;
    //                 });
    //                 refresh_field("purchase_details");
    //             }
    //             // frm.set_value('purchase_details.',r.message)
    //         }
    //     })
    // }

});
var calculate_investment = function(frm){
        //return console.log(frm);
        frappe.call({
            method: 'car_rental_system.car_rental_system.doctype.vehicle_registration.vehicle_registration.calculate_total_amount',
            args: {
                'purchase_value':frm.doc.purchase_value,
                'car_owner':frm.doc.car_owner,
                'purchase_details':frm.doc.purchase_details,
            },
            callback: function(r){
                if (frm.doc.car_owner == 'Company'){
                    frm.set_value({'amount': r.message,'percent': 100})
                    //console.log(r.message);
                }
                else{
                    //console.log(r.message);
                    frm.set_value('purchase_details',[]);
                    refresh_field("purchase_details");
                    $.each(r.message.investment, function(_i, e) {
                        let entry = frm.add_child('purchase_details');
                        entry.investor_id = e.investor_id;
                        entry.inv_percentage = e.get_percent;
                        entry.investment_amount = e.invested_amount;
                    });
                    refresh_field("purchase_details");
                }
                // frm.set_value('purchase_details.',r.message)
            }
        })
    
}

frappe.ui.form.on("Vehicle Purchasing Detail","inv_percentage",function(frm,cdt,cdn){
    // let investment = locals[cdt][cdn]
    calculate_investment(frm);
    // let investment_amount =  
    // console.log('zeeshan',investment_amount);
    //investment.investment_amount = investment_amount

    //frm.refresh_feild('purchase_details')
    
})
