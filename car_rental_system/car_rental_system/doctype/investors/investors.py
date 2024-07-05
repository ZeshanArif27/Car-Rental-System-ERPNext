# Copyright (c) 2024, Zeeshan arif and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _,msgprint


class Investors(Document):
	pass

# @frappe.whitelist()
# def total_investment(
# 	name: str | list,
# ): 	
# 	values={
# 		"name":name
# 	}
# 	investment = frappe.db.sql("""SELECT SUM(amt_of_inv) AS investment_sum FROM `tabInvestment Details` tdi WHERE tdi.parent = %(name)s""",values = values, as_dict=1)

# 	if investment[0].investment_sum is not None:
# 		investment = float(investment[0].investment_sum)
# 	else:
# 		investment = 0

# 	response_data = {
# 		'investment': investment
# 	}
# 	return response_data


@frappe.whitelist()
def get_investment(name: str | list ):
	
	values={
		"name":name
	}
	total_investment = 0
	get_investment = frappe.db.sql("""SELECT tvr.name, tvr.model_name, tvr.immarticulation_date, tvpd.inv_percentage, tvpd.investment_amount FROM `tabVehicle Purchasing Detail` tvpd JOIN tabInvestors ti ON ti.name  = tvpd.investor_id JOIN `tabVehicle Registration` tvr ON tvr.name = tvpd.parent WHERE investor_id  = %(name)s""",values = values, as_dict=1)

	for investment in get_investment:
		total_investment += investment.investment_amount

	if total_investment is not None:
			investment = float(total_investment)
	else:
		investment = 0

	return {
		'get_investment':get_investment,
		'investment':investment
	}
	

