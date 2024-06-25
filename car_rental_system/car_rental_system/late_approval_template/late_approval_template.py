# Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import datetime
import json

import frappe
from frappe.model.document import Document
from frappe.utils import getdate


class LateApprovalTemplate(Document):
	pass

@frappe.whitelist()
def get_employees(
	date: str | datetime.date,
	department: str | None = None,
	branch: str | None = None,
	company: str | None = None,
	shift:str | None = None,
) -> dict[str, list]:
	#filters = {"status": "Active", "date_of_joining": ["<=", date]}
	filters={}
	for field, value in {"department": department, "attendance_date": date, "company": company, "shift":shift,"docstatus": 1, "late_entry":1,}.items():
		if value:
			filters[field] = value

	# employee_list = frappe.get_list(
	# 	"Employee", fields=["employee", "employee_name"], filters=filters, order_by="employee_name"
	# )
	attendance_list = frappe.get_list(
		"Attendance",
		fields=["employee", "employee_name", "status"],
		filters=filters,
		# filters={
		# 	"attendance_date": date,
		# 	"docstatus": 1,
		# 	"late_entry":1,
		# 	"shift": shift,
		# },
		order_by="employee_name",
	)

	# get_attendance = _get_attendance(employee_list, attendance_list)

	return {"attendance": attendance_list}
	#return {"marked": attendance_list, "unmarked": unmarked_attendance}

# def _get_attendance(employee_list: list[dict], attendance_list: list[dict]) -> list[dict]:
# 	marked_employees = [entry.employee for entry in attendance_list]
# 	get_attendance = []

# 	for entry in employee_list:
# 		if entry.employee not in marked_employees:
# 			get_attendance.append(entry)

# 	return get_attendance

@frappe.whitelist()
def mark_employee_late(
	employee_list: list | str,
	date: str | datetime.date,
	late_approved: int | None = None,
) -> None:
	if isinstance(employee_list, str):
		employee_list = json.loads(employee_list)

	for employee in employee_list:
		
		# attendance = frappe.get_doc(
		# 	dict(
		# 		doctype="Attendance",
		# 		employee=employee,
		# 		attendance_date=getdate(date),
		# 		late_entry=late_approved
		# 	)
		# )
		doc = frappe.get_last_doc('Attendance',filters={"employee":employee,"attendance_date":getdate(date)})
		#doc = frappe.get_doc("Attendance",attendance)
		doc.late_entry = late_approved

		doc.db_update()
		# attendance.update()
		# attendance.submit()