import streamlit as st
import google.generativeai as genai

st.title("안전 관리 시스템 (Safety Management)")

# API 키 설정 (보안을 위해 비밀 설정에서 관리하는 것이 좋지만, 일단 실행 확인용)
# 나중에 Streamlit Settings의 Secrets에 넣는 것을 권장합니다.
api_key = st.text_input("Gemini API Key를 입력하세요", type="password")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    user_input = st.text_area("안전 점검 내용을 입력하세요:")
    if st.button("분석 시작"):
        response = model.generate_content(user_input)
        st.write("### 분석 결과")
        st.write(response.text)
else:
    st.warning("API 키를 입력해주세요.")
