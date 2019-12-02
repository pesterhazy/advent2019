(ns advent.util)

(defn read-longs [fname]
  (->> (clojure.java.io/reader (str "inputs/" fname))
       line-seq
       (map #(Long/parseLong %))))

(defn read-csv [fname]
  (->> (clojure.java.io/reader (str "inputs/" fname))
       line-seq
       (map (fn [line]
              (clojure.string/split line #",")))))

(defn read-csv-longs [fname]
  (->> (read-csv fname)
       (map (fn [row]
              (map #(Long/parseLong %) row)))))
