"use client";

import locale from "antd/locale/th_TH";
import AntdRegistry from "@/app/antdRegistry";
import { ConfigProvider } from "antd";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import dayjs from "dayjs";

dayjs.locale("th");
dayjs.extend(buddhistEra);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={locale}
        theme={{
          token: {
            fontFamily: "Kanit",
            colorPrimary: "#244cc3",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
