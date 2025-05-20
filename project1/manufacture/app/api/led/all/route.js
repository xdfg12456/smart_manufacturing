import { NextResponse } from "next/server";
import pool from "@/app/libs/mysql"

const convertLedCode = (code) => {
    if (code[1] == '1') {
        return 0
    }
    else if (code[0] == '1') {
        return 1
    }
    else {
        return 2
    }
}

const processData = (datas) => {
    const result = {};
    const base_date = new Date('2025-03-01T00:00:00')

    datas.forEach(element => {
        const minute = element.time_interval

        const date = new Date(base_date.getTime() + minute * 60000)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()

        const suffix = hour < 12 ? '_D' : '_N'
        const key = `${month}/${day}${suffix}`
        const machine = element.machine
        const code = convertLedCode(element.led_code)

        if (!result[key]) result[key] = {}
        if (!result[key][machine]) {
            result[key][machine] = 0;
        }

        if (code == 0) result[key][machine] += 1
    })

    return result
}

export async function GET() {
    try {
        const db = await pool.getConnection()
        const query = 'select machine, time_interval, led_code from led'
        const [rows] = await db.execute(query)
        let res = processData(rows)
        db.release()

        return NextResponse.json(res)
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}