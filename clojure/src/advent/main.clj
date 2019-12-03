(ns advent.main)

(defn -main [puzzle]
  (let [name (str "advent.puzzle" (format "%02d" (Long/parseLong puzzle)))]
    (require (symbol name))
    (doseq [fun ["solution" "solution-2"]]
      (prn (symbol fun) (time ((resolve (symbol name fun))))))))
