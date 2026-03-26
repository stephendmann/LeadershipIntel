/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      /* Brand CSS variables */
      :root {
        --brand-teal: #005577;
        --charcoal: #1b263b;
        --bg: #f5f6f5;
        --steel: #778da9;
        --border: rgba(0, 85, 119, 0.12);
      }

      /* 底色 */
      body {
        background-color: var(--bg);
        color: var(--charcoal);
      }
      .dark body {
        background-color: black;
      }

      /* 菜单下划线动画 */
      #theme-next .menu-link {
        text-decoration: none;
        background-image: linear-gradient(var(--brand-teal), var(--brand-teal));
        background-repeat: no-repeat;
        background-position: bottom center;
        background-size: 0 2px;
        transition: background-size 100ms ease-in-out;
      }
      #theme-next .menu-link:hover {
        background-size: 100% 2px;
        color: var(--brand-teal);
      }
    `}</style>
  )
}

export { Style }
