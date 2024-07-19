# Copyright (c) 2024, Zeeshan arif and contributors
# For license information, please see license.txt
from datetime import datetime 
from frappe import _,msgprint
import frappe
from frappe.model.document import Document


class Reservations(Document):
	pass

@frappe.whitelist()
def feature_list(
	vehicle_class: str | list
):
	values = {'parent':vehicle_class}

	feature_list = frappe.db.sql("""
	SELECT vehicle_features FROM tabFeatures tf WHERE parent = %(parent)s 
	""", values=values, as_dict=1)

	return {
		'features': feature_list
	}
@frappe.whitelist()
def rate_list(
	vehicle_class: str | list,
	booking_date_from,
	booking_date_to,
	booking_type: str,
):
	try:
		frm_date=datetime.strptime(booking_date_from,'%Y-%m-%d %H:%M:%S').date()
		to_date=datetime.strptime(booking_date_to,'%Y-%m-%d %H:%M:%S').date()
		# frappe.msgprint(_(frm_date),raise_exception=True)
		values = {'parent':vehicle_class, 'booking_date_from':frm_date, 'booking_date_to': to_date}
		rate_list = frappe.db.sql("""
				SELECT 
				tvc.name, 
				tvc.has_season,
				tvc.daily_rate,
				tvc.hourly_rate,
				tvc.weeky_rate,
				tvc.monthly_rate,
				ts.season_name,
				ts.season_start_date,
				ts.season_end_date,
				ts.season_hourly_rate,
				ts.season_daily_rate,
				ts.season_weekly_rate,
				ts.season_monthly_rate 
				FROM 
					`tabVehicle Class` tvc 
				LEFT JOIN 
					tabSeasons ts 
				ON 
					tvc.name = ts.parent
				WHERE 
					ts.parent = %(parent)s And
					(%(booking_date_from)s BETWEEN ts.season_start_date and ts.season_end_date
					OR %(booking_date_to)s BETWEEN ts.season_start_date and ts.season_end_date )
					or(
					%(booking_date_from)s  BETWEEN ts.season_end_date and ts.season_start_date
					OR %(booking_date_to)s BETWEEN ts.season_end_date and ts.season_start_date 
					)
				""", values=values, as_dict=1)
		# frappe.msgprint(_(rate_list),raise_exception=True)
		season_data=[]
		rate_length=len(rate_list)
		boking=f"season_{booking_type.lower()}_rate"
		booking_date_from=datetime.strptime(booking_date_from,'%Y-%m-%d %H:%M:%S')
		booking_date_to=datetime.strptime(booking_date_to,'%Y-%m-%d %H:%M:%S')
		
		for index,rates in  enumerate(rate_list):
			season_start_date=rates.season_start_date.strftime('%Y-%m-%d')
			season_end_date=rates.season_end_date.strftime('%Y-%m-%d')
			rates.season_start_date=datetime.strptime(season_start_date,'%Y-%m-%d')
			rates.season_end_date=datetime.strptime(season_end_date,'%Y-%m-%d')
			
			if rates.has_season:
				if rate_length ==2:
					if index==0:
						num_days=rates.season_end_date - booking_date_from
					else:
						num_days=booking_date_to - rates.season_start_date
				elif rate_length >2:
					if index == 0:
						num_days=rates.season_end_date - booking_date_from
					elif index == rate_length -1:
						num_days=booking_date_to - rates.season_start_date
					else:
						num_days=rates.season_end_date- rates.season_start_date
				else:
					num_days=booking_date_to - booking_date_from

				if booking_type == "Hourly":
					valcount=num_days.total_seconds()/3600
				else:
					valcount=num_days.days + 1

				
				season_data.append({ 
				'season_name':rates.season_name,
				'season_start_date':rates.season_start_date,
				'season_end_date':rates.season_end_date,
				'booking_rate':rates.get(boking),
				'reservation_period': valcount,
				'total_amount': (rates.get(boking)) * (valcount)
				})
			else:
				num_days=booking_date_to - booking_date_from

				if booking_type == "Hourly":
					valcount=num_days.total_seconds()/3600
				else:
					valcount=num_days.days + 1

				return [{
						'season_name': 'Default Season',
						'season_start_date': '2024-01-01',
						'season_end_date': '2024-12-31',
						'booking_rate':rates.get(boking),
						'reservation_period':valcount,
						'total_amount': (rates.get(boking)) * (valcount)
					}]

		
		return season_data
	except Exception as e:
		frappe.msgprint(
			msg= str(e),
			title='Error',
			raise_exception=FileNotFoundError
		)
		return e

@frappe.whitelist()
def calculate_vat_rate(
	sales_tax_charge_templates: str,
):
	values={'sales_tax_charge_templates':sales_tax_charge_templates}
	sales_and_tax = frappe.db.sql("""
		SELECT * FROM `tabSales Taxes and Charges` tstac WHERE parent = %(sales_tax_charge_templates)s
	""",values=values ,as_dict=1)
	return sales_and_tax
