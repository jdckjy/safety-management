import streamlit as st
import google.generativeai as genai

# 1. 사이트 설정 및 제목
st.set_page_config(page_title="안전 관리 시스템", layout="centered")
st.title("🛡️ 안전 관리 AI 시스템")
st.info("내용을 입력하고 분석 시작을 누르면 AI가 즉시 답변합니다.")

# 2. Secrets에서 API 키 자동으로 가져오기
if "GOOGLE_API_KEY" in st.secrets:
    api_key = st.secrets["GOOGLE_API_KEY"]
    genai.configure(api_key=api_key)
    genai.GenerativeModel('models/gemini-1.5-flash')
else:
    st.error("설정(Secrets)에서 API 키를 먼저 등록해주세요!")
    st.stop()

# 3. 사용자 입력창
user_input = st.text_area("안전 점검 내용이나 상황을 입력하세요:", height=200, placeholder="여기에 내용을 입력하세요...")

# 4. 분석 버튼 및 결과 출력
if st.button("🚀 분석 시작"):
    if not user_input.strip():
        st.warning("분석할 내용을 입력해주세요.")
    else:
        with st.spinner('AI가 분석 중입니다...'):
            try:
                response = model.generate_content(user_input)
                st.subheader("📋 AI 분석 결과")
                st.markdown(response.text)
            except Exception as e:
                st.error(f"오류가 발생했습니다: {e}")
