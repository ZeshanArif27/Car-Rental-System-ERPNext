// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle Registration", {
    purchase_value: function (frm) {
        if (frm.doc.car_owner != "") {
            calculate_investment(frm);
        }
    },
    car_owner: function (frm) {
        calculate_investment(frm)
    },
    percent: function (frm) {
        if (frm.doc.car_owner != "" && frm.doc.car_owner != "Company") {
            calculate_investment(frm);
        }
    },
    before_submit: function (frm) {
        validate_vehicle_registration(frm)
    }

});
var validate_vehicle_registration = function (frm) {
    seen = []
    if (frm.doc.car_owner != "Company") {
        for (item of frm.doc.purchase_details) {
            if (seen.includes(item.investor_id) || item.inv_percentage <= 0) {
                frappe.throw({ message: __("Investor already exist or investment percentage is zero"), title: __('Validation Error'), indicator: 'red' });
                return false
            }
            else {
                seen.push(item.investor_id);
            }
        }
    }
}
var calculate_investment = function (frm) {
    frappe.call({
        method: 'car_rental_system.car_rental_system.doctype.vehicle_registration.vehicle_registration.calculate_total_amount',
        args: {
            'purchase_value': frm.doc.purchase_value,
            'car_owner': frm.doc.car_owner,
            'purchase_details': frm.doc.purchase_details,
            'percent': frm.doc.percent | 0,
        },
        callback: function (r) {
            if (frm.doc.car_owner == 'Company') {
                frm.set_value({ 'amount': r.message, 'percent': 100 })
            }
            else {
                frm.set_value({ 'percent': frm.doc.percent, 'amount': r.message.amount })
                frm.set_value('purchase_details', []);
                refresh_field("purchase_details");
                $.each(r.message.investment, function (_i, e) {
                    let entry = frm.add_child('purchase_details');
                    entry.investor_id = e.investor_id;
                    entry.inv_percentage = e.get_percent;
                    entry.investment_amount = e.invested_amount;
                });
                refresh_field("purchase_details");
            }
        }
    });
}

frappe.ui.form.on("Vehicle Purchasing Detail", "inv_percentage", function (frm, cdt, cdn) {
    calculate_investment(frm);
});
