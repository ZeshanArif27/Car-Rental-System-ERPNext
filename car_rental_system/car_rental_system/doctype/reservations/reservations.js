// Copyright (c) 2024, Zeeshan arif and contributors
// For license information, please see license.txt

frappe.ui.form.on("Reservations", {
    before_load(frm) {
        if (frm.doc.status == 'Completed') {
            frm.set_df_property('fine_charges', 'read_only', 0);
            frm.set_df_property('damage_charges', 'read_only', 0);
            frm.set_df_property('salik_charges', 'read_only', 0);
            frm.set_df_property('extra_km_charges', 'read_only', 0);
        }
        else {
            frm.set_df_property('fine_charges', 'read_only', 1);
            frm.set_df_property('damage_charges', 'read_only', 1);
            frm.set_df_property('salik_charges', 'read_only', 1);
            frm.set_df_property('extra_km_charges', 'read_only', 1);
        }

    },
    sales_tax_charge_templates: function (frm) {
        frappe.call({
            method: 'car_rental_system.car_rental_system.doctype.reservations.reservations.calculate_vat_rate',
            args: {
                'sales_tax_charge_templates': frm.doc.sales_tax_charge_templates
            },
            callback: function (r) {
                console.log(r.message);
                net_total = frm.doc.car_rent + frm.doc.insurance + frm.doc.fine_charges + frm.doc.damage_charges + frm.doc.salik_charges + frm.doc.extra_km_charges
                net_includig_tax = 0
                sum_charges = 0
                $.each(r.message, function (_i, e) {
                    console.log(r.message);
                    let entry = frm.add_child('tax_charges');
                    entry.charge_type = e.charge_type;
                    entry.account_head = e.account_head;
                    entry.rate = e.rate;
                    entry.description = e.description;
                    entry.tax_amount = (net_total * e.rate) / 100;
                    entry.total = entry.tax_amount + net_total;

                    refresh_field("tax_charges");
                    sum_charges += entry.tax_amount
                    net_includig_tax += entry.total
                });

                outstanding_amount = net_includig_tax - frm.doc.security_deposit
                rounded_total = Math.round(net_includig_tax);
                frm.set_value({ 'net_total': net_total, 'total_advance': frm.doc.security_deposit, 'total_amount': net_includig_tax, 'outstanding_amount': outstanding_amount, 'total_taxes_and_charges': sum_charges, 'rounded_total': rounded_total })
               
            }

        })
    },
    percent: function (frm) {
        if (frm.doc.percent != 0) {
            total_discount = (frm.doc.percent * frm.doc.total_amount) / 100
            total_amount = frm.doc.total_amount - total_discount
            rounded_total = Math.round(total_amount);
            outstanding_amount = rounded_total - frm.doc.security_deposit
            console.log(total_discount,total_amount,rounded_total,outstanding_amount);
            frm.set_value({ 'total_discount': total_discount, 'rounded_total': rounded_total, 'total_amount':total_amount, 'outstanding_amount': outstanding_amount})
        }
        
    },
    vehicle_class: function (frm) {
        frm.set_value({ 'vehicle': '', 'features': [] })
    },
    vehicle: function (frm) {
        frappe.call({
            method: 'car_rental_system.car_rental_system.doctype.reservations.reservations.feature_list',
            args: {
                'vehicle_class': frm.doc.vehicle_class,
            },
            callback: function (r) {
                // console.log(r.message);
                frm.set_value('features', []);
                refresh_field('features');
                $.each(r.message.features, function (_i, e) {
                    let entry = frm.add_child('features');
                    entry.vehicle_features = e.vehicle_features;
                    refresh_field("features");
                });
            }
        });
        if (frm.doc.booking_date_from && frm.doc.booking_date_to) {
            frappe.call({
                method: 'car_rental_system.car_rental_system.doctype.reservations.reservations.rate_list',
                args: {
                    'vehicle_class': frm.doc.vehicle_class,
                    'booking_date_from': frm.doc.booking_date_from,
                    'booking_date_to': frm.doc.booking_date_to,
                    'booking_type': frm.doc.booking_type,
                },
                callback: function (r) {
                    console.log(r.message)
                    frm.set_value('vehicle_rates', []);
                    refresh_field('vehicle_rates');
                    sum_total = 0
                    $.each(r.message, function (_i, e) {
                        let entry = frm.add_child('vehicle_rates');
                        entry.season_name = e.season_name;
                        entry.season_from = e.season_start_date;
                        entry.season_to = e.season_end_date;
                        entry.reservation_period = e.reservation_period;
                        entry.rates = e.booking_rate;
                        entry.total_amount = e.total_amount

                        refresh_field("vehicle_rates");
                        sum_total += e.total_amount
                    });
                    frm.set_value('car_rent', sum_total);
                },
                error: function (r) {
                    frappe.msgprint({
                        title: __('Information'),
                        indicator: 'yellow',
                        message: __(r.message)
                    });
                    frappe.set_value('booking_date_from', 1)
                }
            });
        } else {
            frappe.msgprint({
                title: __('Information'),
                indicator: 'yellow',
                message: __('Please Select Booking Date')
            });
            frm.set_value('booking_date_from', 1);
        }
    }
});
