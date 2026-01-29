import streamlit as st
import google.generativeai as genai

st.title("안전 관리 시스템 (Safety Management)")

# API 키 설정
api_key = st.text_input("Gemini API Key를 입력하세요", type="password")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    user_input = st.text_area("안전 점검 내용을 입력하세요:")
    
    if st.button("분석 시작"):
        # 수정된 부분: 입력값이 비어있는지 확인
        if user_input.strip() == "":
            st.warning("내용을 입력한 뒤 버튼을 눌러주세요.")
        else:
            try:
                response = model.generate_content(user_input)
                st.write("### 분석 결과")
                st.write(response.text)
            except Exception as e:
                st.error(f"오류가 발생했습니다: {e}")
else:
    st.warning("API 키를 입력해주세요.")
