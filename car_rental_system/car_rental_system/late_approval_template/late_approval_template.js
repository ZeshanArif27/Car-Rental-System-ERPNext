// Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on("Late Approval Template", {
	refresh(frm) {
		frm.trigger("reset_attendance_fields");
		frm.trigger("load_employees");
		frm.trigger("set_primary_action");
    },
    onload(frm) {
		frm.set_value("date", frappe.datetime.get_today());
	},

	date(frm) {
		frm.trigger("load_employees");
	},

	department(frm) {
		frm.trigger("load_employees");
	},

	branch(frm) {
		frm.trigger("load_employees");
	},

	company(frm) {
		frm.trigger("load_employees");
	},

	status(frm) {
		frm.trigger("set_primary_action");
	},

	reset_attendance_fields(frm) {
		frm.set_value("shift", "");
		frm.set_value("late_approved", 0);
	},
    load_employees(frm) {
		if (!frm.doc.date) return;

		frappe
			.call({
				method: "hrms.hr.doctype.late_approval_template.late_approval_template.get_employees",
				args: {
					date: frm.doc.date,
					department: frm.doc.department,
					branch: frm.doc.branch,
					company: frm.doc.company,
				},
			})
			.then((r) => {
				frm.employees = r.message["attendance"];

				if (r.message["attendance"].length > 0) {
					unhide_field("select_employees_section");
					//unhide_field("late_details_section");
					frm.events.show_unmarked_employees(frm, r.message["attendance"]);
				} else {
					hide_field("select_employees_section");
					//hide_field("late_details_section");
				}
			});
	},

	show_unmarked_employees(frm, attendance) {
        console.log(attendance);
		const $wrapper = frm.get_field("employees_html").$wrapper;
		$wrapper.empty();
		const employee_wrapper = $(`<div class="employee_wrapper">`).appendTo($wrapper);

		frm.employees_multicheck = frappe.ui.form.make_control({
			parent: employee_wrapper,
			df: {
				fieldname: "employees_multicheck",
				fieldtype: "MultiCheck",
				select_all: true,
				columns: 4,
				get_data: () => {
					return attendance.map((employee) => {
						return {
							label: `${employee.employee} : ${employee.employee_name}`,
							value: employee.employee,
							checked: 0,
						};
					});
				},
			},
			render_input: true,
		});

		frm.employees_multicheck.refresh_input();
	},
    set_primary_action(frm) {
		frm.disable_save();
		frm.page.set_primary_action(__("Mark Late Approval"), () => {
			if (frm.employees.length === 0) {
				frappe.msgprint({
					message: __(
						"Late Approval for all the employees under this criteria has been marked already.",
					),
					title: __("Late Approved"),
					indicator: "green",
				});
				return;
			}

			if (frm.employees_multicheck.get_checked_options().length === 0) {
				frappe.throw({
					message: __("Please select the employees you want to mark late approval for."),
					title: __("Mandatory"),
				});
			}

			// if (!frm.doc.shift) {
			// 	frappe.throw({
			// 		message: __("Please select the shift for employees."),
			// 		title: __("Mandatory"),
			// 	});
			// }

			frm.trigger("mark_late_approval");
		});
	},

	mark_late_approval(frm) {
		const marked_employees = frm.employees_multicheck.get_checked_options();

		frappe
			.call({
				method: "hrms.hr.doctype.late_approval_template.late_approval_template.mark_employee_late",
				args: {
					employee_list: marked_employees,
					date: frm.doc.date,
					late_entry: frm.doc.late_approved,
					shift: frm.doc.shift,
				},
				freeze: true,
				freeze_message: __("Marking Late Approvals"),
			})
			.then((r) => {
				if (!r.exc) {
					frappe.show_alert({
						message: __("Lates Approved successfully"),
						indicator: "green",
					});
					frm.refresh();
				}
			});
	},
});
