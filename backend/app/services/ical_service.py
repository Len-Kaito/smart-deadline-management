import datetime
from icalendar import Calendar
import recurring_ical_events
import pytz


def format_time(dt_obj, is_end_of_day=False):
    if is_end_of_day:
        return "24:00"
    return dt_obj.strftime("%H:%M")


def analyze_all_free_time(ics_string, timezone_str="Asia/Ho_Chi_Minh"):
    tz = pytz.timezone(timezone_str)

    try:
        cal = Calendar.from_ical(ics_string)
    except ValueError:
        return {"error": "Nội dung file không đúng chuẩn iCalendar (.ics)."}

    now = datetime.datetime.now(tz)
    start_search = now - datetime.timedelta(days=30)
    end_search = now + datetime.timedelta(days=365)

    events = recurring_ical_events.of(cal).between(start_search, end_search)
    if not events:
        return {"error": "Không tìm thấy sự kiện nào trong file lịch."}

    daily_events = {}
    for event in events:
        start_dt = event["DTSTART"].dt
        end_dt = event["DTEND"].dt

        if type(start_dt) is datetime.date:
            start_dt = tz.localize(datetime.datetime.combine(start_dt, datetime.time.min))
            end_dt = tz.localize(datetime.datetime.combine(end_dt, datetime.time.min))
        elif start_dt.tzinfo is None:
            start_dt = tz.localize(start_dt)
            end_dt = tz.localize(end_dt)

        date_str = start_dt.date().strftime("%Y-%m-%d")
        if date_str not in daily_events:
            daily_events[date_str] = []

        summary = str(event.get("SUMMARY", "Sự kiện không tên"))
        daily_events[date_str].append({"start": start_dt, "end": end_dt, "name": summary})

    report_data = {}
    sorted_dates = sorted(daily_events.keys())

    for date_str in sorted_dates:
        slots_of_day = daily_events[date_str]
        current_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

        start_of_day = tz.localize(datetime.datetime.combine(current_date, datetime.time(0, 0)))
        end_of_day = start_of_day + datetime.timedelta(days=1)

        slots_of_day.sort(key=lambda x: x["start"])
        merged_busy = []
        for slot in slots_of_day:
            s = max(slot["start"], start_of_day)
            e = min(slot["end"], end_of_day)
            if s >= e:
                continue

            if not merged_busy:
                merged_busy.append({"start": s, "end": e, "name": slot["name"]})
            else:
                last_slot = merged_busy[-1]
                if s <= last_slot["end"]:
                    last_slot["end"] = max(last_slot["end"], e)
                    if slot["name"] not in last_slot["name"]:
                        last_slot["name"] += " / " + slot["name"]
                else:
                    merged_busy.append({"start": s, "end": e, "name": slot["name"]})

        free_slots = []
        current_time = start_of_day
        total_free_seconds = 0

        for slot in merged_busy:
            if current_time < slot["start"]:
                free_slots.append({"start": current_time, "end": slot["start"]})
                total_free_seconds += (slot["start"] - current_time).total_seconds()
            current_time = max(current_time, slot["end"])

        if current_time < end_of_day:
            free_slots.append({"start": current_time, "end": end_of_day, "is_end_of_day": True})
            total_free_seconds += (end_of_day - current_time).total_seconds()

        report_data[date_str] = {
            "busy": merged_busy,
            "free": free_slots,
            "total_free_seconds": total_free_seconds,
        }

    return {"error": None, "report": report_data}
