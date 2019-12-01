(ns advent.util)

(defn read-longs [fname]
  (->> (clojure.java.io/reader (str "inputs/" fname))
       line-seq
       (map #(Long/parseLong %))))
