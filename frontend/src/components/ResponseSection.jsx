import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { T, sn } from "../constants/theme";
import { MODELS } from "../constants/models";
import Btn from "./Btn";
import SectionLabel from "./SectionLabel";
import Card from "./Card";

export default function ResponseSection({ resp, loading, model, onEvaluate, evaling }) {
  const { t } = useTranslation();

  if (!resp && !loading) return null;

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <SectionLabel style={{ margin: 0 }}>{t("exercise.aiResponse")}</SectionLabel>
        <span style={{ fontSize: 10, color: T.td, fontFamily: sn }}>{MODELS.find(m => m.id === model)?.name}</span>
      </div>
      {loading ? (
        <p style={{ fontSize: 13, color: T.tm, fontStyle: "italic" }}>{t("exercise.generating")}</p>
      ) : (
        <>
          <div className="md-response" style={{ fontSize: 13, color: T.text, lineHeight: 1.75, maxHeight: 400, overflowY: "auto" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{resp}</ReactMarkdown>
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn onClick={onEvaluate} disabled={evaling} v="secondary">
              {evaling ? t("exercise.evaluating") : t("exercise.evaluateScore")}
            </Btn>
          </div>
        </>
      )}
    </Card>
  );
}
