import { NextResponse } from "next/server";
import pool from "@/app/libs/mysql"

const checkGreenLight = (code) => {
    if (code[1] == '1') {
        return true
    } else {
        return false
    }
}

const processData = (datas) => {
    try {
        var out = Array(63).fill(0)

        datas.map((data) => {
            if (checkGreenLight(data['led_code'])) {
                let index = Math.floor(parseInt(data['time_interval']) / 720)
                out[index] += 1
            }
        })
        return { 'data': out }
    } catch (e) {
    }
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