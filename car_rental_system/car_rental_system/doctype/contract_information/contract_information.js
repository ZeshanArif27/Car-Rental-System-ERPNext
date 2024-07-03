// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Contract Information", {
	refresh(frm) {
		frm.trigger('total_amt');
	},
	onsubmit(frm){
		frm.trigger('total_amt');
	},

	// onload(frm){
	// 	frm.trigger('total_amt');
	// },
	total_amt: function(frm){
		frappe.call({
			method: 'car_rental_system.car_rental_system.doctype.contract_information.contract_information.total_amount',
			args:{
				name: frm.doc.name
				//'rent': frm.doc.rent,
				// 'insurance_amt': frm.doc.insurance_amt,
				// 'salik_charges': frm.doc.salik_charges,
				// 'total_extra_kms': frm.doc.total_extra_kms,
				// 'damage_charges': frm.doc.damage_charges,
				// 'vat':frm.doc.vat,
				// 'paid_amt': frm.doc.paid_amt,
			},
			callback: function (r) {
				console.log(r.message);
				frm.set_value({
					'total_amt': r.message.total_amount,
					'balance': r.message.balance,
				});
			},
			error: function(r){
				console.log(r.message)
			}
		});
	},
});
