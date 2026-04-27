package com.example.resqsense.data

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

data class AnalysisRequest(val message: String)
data class AnalysisResponse(val result: String)

interface AiApiService {
    @POST("api/ai/analyze-message")
    suspend fun analyzeMessage(@Body request: AnalysisRequest): Response<AnalysisResponse>

    companion object {
        // Change this to your local IP if testing on a real device
        private const val BASE_URL = "http://10.0.2.2:5002/" 

        fun create(): AiApiService {
            val logger = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
            
            val client = OkHttpClient.Builder()
                .addInterceptor(logger)
                .connectTimeout(2, TimeUnit.SECONDS) // 2 sec timeout as requested
                .readTimeout(2, TimeUnit.SECONDS)
                .writeTimeout(2, TimeUnit.SECONDS)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(AiApiService::class.java)
        }
    }
}
