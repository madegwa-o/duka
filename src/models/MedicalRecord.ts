import { Schema, model, models, type Types, type Document } from "mongoose"

export enum UrgencyLevel {
    EMERGENCY = "EMERGENCY",
    URGENT = "URGENT",
    ROUTINE = "ROUTINE",
    NON_URGENT = "NON_URGENT",
}

export enum RecordStatus {
    DRAFT = "DRAFT",
    FINAL = "FINAL",
}

export interface IMedicalRecord extends Document {
    _id: Types.ObjectId
    userId: Types.ObjectId
    callDate: Date
    callDuration: number // in seconds
    transcript: string
    symptoms: string[]
    diagnosis: string
    recommendations: string[]
    specialistType: string
    urgencyLevel: UrgencyLevel
    additionalNotes: string
    status: RecordStatus
    createdAt: Date
    updatedAt: Date
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        callDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        callDuration: {
            type: Number,
            required: true,
            default: 0,
        },
        transcript: {
            type: String,
            required: true,
            default: "",
        },
        symptoms: {
            type: [String],
            default: [],
        },
        diagnosis: {
            type: String,
            default: "",
        },
        recommendations: {
            type: [String],
            default: [],
        },
        specialistType: {
            type: String,
            default: "",
        },
        urgencyLevel: {
            type: String,
            enum: Object.values(UrgencyLevel),
            default: UrgencyLevel.ROUTINE,
        },
        additionalNotes: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: Object.values(RecordStatus),
            default: RecordStatus.DRAFT,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

export const MedicalRecord = models.MedicalRecord || model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema)
