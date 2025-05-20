import { NextResponse } from "next/server";
import pool from "@/app/libs/mysql"

export async function GET() {
    try {
        const db = await pool.getConnection()
        const query = 'select machine, time_interval, led_code from led'
        const [rows] = await db.execute(query)
        db.release()

        return NextResponse.json(rows)
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 })
    }
}