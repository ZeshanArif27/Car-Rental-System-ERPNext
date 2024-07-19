// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on('Vehicle Maintenance', {
    refresh(frm) {
        // Add custom button
        frm.add_custom_button(__('Repair Order'), function() {
            // Navigate to Repair Order form
            frappe.new_doc('Repair Order', true);
        });
    }
});

// on_submit: function(frm){
//     if (frm.doc.status == 1) {
        
//     }
// }
