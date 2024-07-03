# Copyright (c) 2024, Zeeshan arif and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _,msgprint
import json

class VehicleRegistration(Document):
	pass

@frappe.whitelist()
def calculate_total_amount(
		purchase_value: float | int,
		car_owner: str | list,
		purchase_details
): 
	investment = []
	sum_of_percent = 0
	if purchase_value <= 0:
		frappe.msgprint(_("Purchase Value cannot be less than zero."),raise_exception=True)
	else:
		if car_owner == 'Company':
			amount = calculate_amt_based_on_percent(purchase_value,100)
			return amount
		elif car_owner == 'Investors':
			seen = []
			for investors in  json.loads(purchase_details):
				if investors.get('investor_id') not in seen :
					seen.append(investors.get('investor_id'))
				else:
					frappe.msgprint(_(f"Investor already exist please remove the duplicate investor. Investor NO: {investors.get('investor_id')}"),raise_exception=True)
				# frappe.msgprint(_(investors),raise_exception=True)
				get_percent = investors.get('inv_percentage')
				invested_amount = calculate_amt_based_on_percent(purchase_value,get_percent)

				investment_details = {
					'investor_id': investors.get('investor_id'),
					'get_percent': get_percent,
					'invested_amount':invested_amount
				}
				investment.append(investment_details)
				sum_of_percent += get_percent

			if sum_of_percent > 100:
				frappe.msgprint(_("Sum of Investors percentage cannot be greater than zero."),raise_exception=True)

			return {'sum_of_percent':sum_of_percent,'investment':investment}
		else:
			return 'HElo world'


def calculate_amt_based_on_percent(
		purchase_value: int | float,
		percentage: int | float,
):
	value = float((purchase_value * percentage)/100)

	return value

